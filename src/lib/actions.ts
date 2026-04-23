"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "./cloudinary";
import bcryptjs from "bcryptjs";
import { ADMIN_PERMISSIONS } from "./constants";

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin && !vendorId) {
    throw new Error("Unauthorized");
  }

  // Security layer: Ensure the booking actually belongs to this vendor's hotel fleet
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { room: { include: { hotel: true } } }
  });

  if (!booking) throw new Error("Booking not found");

  if (!isSuperAdmin && booking.room.hotel.vendorId !== vendorId) {
    throw new Error("Unauthorized to mutate bookings across separate vendors.");
  }

  await db.booking.update({
    where: { id: bookingId },
    data: { 
      status: newStatus,
      checkedInAt: newStatus === "CHECKED_IN" ? new Date() : undefined,
      checkedOutAt: newStatus === "COMPLETED" ? new Date() : undefined
    }
  });

  revalidatePath("/dashboard/bookings");
}

export async function toggleRoomVisibility(roomId: string, currentVisibility: boolean) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin && !vendorId) {
    throw new Error("Unauthorized");
  }

  const room = await db.room.findUnique({
    where: { id: roomId },
    include: { hotel: true }
  });

  if (!room) throw new Error("Room not found");

  if (!isSuperAdmin && room.hotel.vendorId !== vendorId) {
    throw new Error("Unauthorized to mutate rooms across separate vendors.");
  }

  await db.room.update({
    where: { id: roomId },
    data: { isVisible: !currentVisibility },
  });

  revalidatePath("/dashboard/rooms");
}

export async function createRoom(formData: any) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin && !vendorId) throw new Error("Unauthorized");

  const hotelId = formData.hotelId;
  const title = formData.title;
  const category = formData.category;
  const description = formData.description;
  const stayType = formData.stayType; 
  const quantity = parseInt(formData.quantity) || 1;

  // Handle Image Upload
  let imageUrl = null;
  const imageFile = formData.roomImage as File;
  if (imageFile && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer, "rooms");
      imageUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
    }
  }

  const amenityIds = formData.amenityIds || [];

  const room = await db.room.create({
    data: {
      hotelId,
      title,
      category,
      description,
      stayType,
      quantity,
      pricing: {
        create: {
          price3hr: parseFloat(formData.price3hr) || null,
          price6hr: parseFloat(formData.price6hr) || null,
          price12hr: parseFloat(formData.price12hr) || null,
          price24hr: parseFloat(formData.price24hr) || 0,
        }
      },
      amenities: {
        create: amenityIds.map((id: string) => ({ amenityId: id }))
      },
      images: imageUrl ? {
        create: { imageUrl }
      } : undefined
    }
  });

  revalidatePath("/dashboard/rooms");
  return room;
}

export async function createManualBooking(formData: FormData) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin && !vendorId) throw new Error("Unauthorized");

  const roomId = formData.get("roomId") as string;
  const startTimeStr = formData.get("startTime") as string;
  const durationType = formData.get("durationType") as string;
  
  if (!roomId || !startTimeStr || !durationType) throw new Error("Missing required fields");

  const startTime = new Date(startTimeStr);
  const durationHours = parseInt(durationType.replace("hr", "")) || 24;
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  // 1. Overlap Detection & Overwrite Logic
  const activeBookings = await db.booking.findMany({
    where: {
      roomId,
      status: { in: ["PENDING", "ACCEPTED", "CHECKED_IN"] }
    }
  });

  const overlaps = activeBookings.filter(b => {
    const bStart = new Date(b.startTime);
    const bDur = parseInt(b.durationType.replace("hr", "")) || 24;
    const bEnd = new Date(bStart.getTime() + bDur * 60 * 60 * 1000);
    return (startTime < bEnd && endTime > bStart);
  });

  for (const overlap of overlaps) {
    if (overlap.status === "CHECKED_IN") {
      throw new Error("Room is already occupied by an arrived guest. Overwrite blocked.");
    }

    // No-Show Overwrite logic
    const isNoShow = new Date(overlap.startTime) < new Date();
    if (isNoShow) {
      if (overlap.paymentStatus === "PENDING") {
        // Automatically Cancel the no-show pending booking as requested
        await db.booking.update({
          where: { id: overlap.id },
          data: { 
            status: "REJECTED", 
            rejectionReason: "Cancelled due to manual overwrite by vendor for walk-in guest." 
          }
        });
      }
    } else {
       throw new Error("Overlap detected with a future reservation. Please adjust the time.");
    }
  }

  // 2. Find or Create Walk-in User
  let walkInUser = await db.user.findFirst({ where: { email: "walkin@guest.com" } });
  if (!walkInUser) {
    walkInUser = await db.user.create({
      data: {
        name: "Walk-in Guest",
        email: "walkin@guest.com",
        phone: "0000000000",
        passwordHash: "walkin-placeholder",
      }
    });
  }

  // 3. Create the Booking
  const room = await db.room.findUnique({ where: { id: roomId }, include: { pricing: true } });
  const price24hr = room?.pricing?.price24hr || 0;
  const totalPrice = (durationHours / 24) * price24hr;

  // Generate Custom ID
  const prefix = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
  const latest = await db.booking.findFirst({ where: { id: { startsWith: prefix } }, orderBy: { id: 'desc' } });
  const seq = latest ? parseInt(latest.id.substring(prefix.length)) + 1 : 1;
  const bookingId = `${prefix}${seq.toString().padStart(4, '0')}`;

  const booking = await db.booking.create({
    data: {
      id: bookingId,
      userId: walkInUser.id,
      roomId,
      startTime,
      durationType,
      totalPrice,
      status: "CHECKED_IN",
      checkedInAt: new Date(),
      paymentStatus: "PAID",
      paymentMethod: "CASH",
    }
  });

  revalidatePath("/dashboard/availability");
  revalidatePath("/dashboard/bookings");
  return booking;
}

export async function bulkImportBookings(bookingsData: any[]) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin && !vendorId) throw new Error("Unauthorized");

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const data of bookingsData) {
    try {
      // Find room by title or ID
      const room = await db.room.findFirst({
        where: {
          OR: [
            { id: data.roomId },
            { title: data.roomTitle }
          ],
          hotel: !isSuperAdmin ? { vendorId } : undefined
        }
      });

      if (!room) {
        results.failed++;
        results.errors.push(`Room not found: ${data.roomTitle || data.roomId}`);
        continue;
      }

      // Find or create user
      let user = await db.user.findFirst({ where: { email: data.guestEmail || "imported@guest.com" } });
      if (!user) {
        user = await db.user.create({
          data: {
            name: data.guestName || "Imported Guest",
            email: data.guestEmail || `imported_${Date.now()}@guest.com`,
            phone: data.guestPhone || "0000000000",
            passwordHash: "imported-placeholder"
          }
        });
      }

      // Create booking
      await db.booking.create({
        data: {
          id: data.id || undefined, // Use provided ID or generate one
          userId: user.id,
          roomId: room.id,
          startTime: new Date(data.startTime),
          durationType: data.durationType || "24hr",
          totalPrice: parseFloat(data.totalPrice) || 0,
          status: data.status || "COMPLETED",
          paymentStatus: data.paymentStatus || "PAID",
          paymentMethod: data.paymentMethod || "UNKNOWN",
          checkedInAt: data.checkedInAt ? new Date(data.checkedInAt) : null,
          checkedOutAt: data.checkedOutAt ? new Date(data.checkedOutAt) : null,
        }
      });
      results.success++;
    } catch (err: any) {
      results.failed++;
      results.errors.push(`Failed to import ${data.guestName}: ${err.message}`);
    }
  }

  revalidatePath("/dashboard/bookings");
  return results;
}
export async function createEmergencyContact(formData: FormData) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  
  if (!vendorId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string;

  await db.emergencyContact.create({
    data: {
      vendorId,
      name,
      phone,
      category,
      notes
    }
  });

  revalidatePath("/dashboard/emergency");
}

export async function deleteEmergencyContact(id: string) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;

  if (!vendorId) throw new Error("Unauthorized");

  const contact = await db.emergencyContact.findUnique({ where: { id } });
  if (!contact || contact.vendorId !== vendorId) throw new Error("Unauthorized");

  await db.emergencyContact.delete({ where: { id } });
  revalidatePath("/dashboard/emergency");
}
export async function updateProfileImage(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorized");

  const imageFile = formData.get("profileImage") as File;
  if (!imageFile || imageFile.size === 0) throw new Error("No image provided");

  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const uploadResult = await uploadToCloudinary(buffer, "profiles");
  const imageUrl = uploadResult.secure_url;

  await db.user.update({
    where: { id: userId },
    data: { image: imageUrl }
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard"); // To update the navbar
  return imageUrl;
}

export async function createHotel(formData: FormData) {
  const session = await auth();
  const vendorId = (session?.user as any)?.vendorId;
  
  if (!vendorId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const location = formData.get("location") as string;
  const description = formData.get("description") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;

  // Handle Image Upload
  let coverImage = null;
  const imageFile = formData.get("coverImage") as File;
  if (imageFile && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer, "hotels");
      coverImage = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
    }
  }

  const hotel = await db.hotel.create({
    data: {
      vendorId,
      name,
      location,
      description,
      city,
      country,
      coverImage,
      status: "PENDING"
    }
  });

  revalidatePath("/dashboard/property");
  return hotel;
}

export async function updateVerificationStatus(documentId: string, status: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await db.userDocument.update({
    where: { id: documentId },
    data: { verificationStatus: status }
  });

  revalidatePath("/dashboard/admin/verifications");
}

export async function updateVendorStatus(vendorId: string, status: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await db.vendor.update({
    where: { id: vendorId },
    data: { approvalStatus: status }
  });

  revalidatePath("/dashboard/admin/vendors");
}

export async function createCountry(name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.locationCountry.create({ data: { name } });
  revalidatePath("/dashboard/admin/locations");
}

export async function createDistrict(countryId: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.locationDistrict.create({ data: { countryId, name } });
  revalidatePath("/dashboard/admin/locations");
}

export async function createCity(districtId: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.locationCity.create({ data: { districtId, name } });
  revalidatePath("/dashboard/admin/locations");
}

export async function updateCountry(id: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.locationCountry.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/admin/locations");
}

export async function updateDistrict(id: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.locationDistrict.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/admin/locations");
}

export async function updateCity(id: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.locationCity.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/admin/locations");
}

export async function createHotelAmenity(name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.hotelAmenity.create({ data: { name } });
  revalidatePath("/dashboard/admin/amenities");
}

export async function updateHotelAmenity(id: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.hotelAmenity.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/admin/amenities");
}

export async function createRoomAmenity(name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.roomAmenity.create({ data: { name } });
  revalidatePath("/dashboard/admin/amenities");
}

export async function updateRoomAmenity(id: string, name: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.roomAmenity.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/admin/amenities");
}

export async function restoreHotel(hotelId: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await db.hotel.update({
    where: { id: hotelId },
    data: { 
      isArchived: false,
      archivedAt: null
    }
  });

  revalidatePath("/dashboard/admin/archive");
  revalidatePath("/dashboard/property");
}

export async function updateUser(userId: string, data: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await db.user.update({
    where: { id: userId },
    data
  });

  revalidatePath("/dashboard/admin/users");
}

export async function updateVendor(vendorId: string, data: any) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  await db.vendor.update({
    where: { id: vendorId },
    data
  });

  revalidatePath("/dashboard/admin/vendors");
}

export async function updateReview(id: string, data: { rating?: number; comment?: string }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.review.update({ where: { id }, data });
  revalidatePath("/dashboard/admin/reviews");
}

export async function deleteReview(id: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");
  await db.review.delete({ where: { id } });
  revalidatePath("/dashboard/admin/reviews");
}

export async function markNotificationAsRead(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await db.notification.update({ where: { id, userId: (session.user as any).id }, data: { isRead: true } });
  revalidatePath("/dashboard");
}

export async function createAdminUser(data: { name: string, email: string, phone: string, password: string, permissions: string[] }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  const hashedPassword = await bcryptjs.hash(data.password, 10);

  const newUser = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash: hashedPassword,
      role: 'ADMIN', // Regular Admin, not Super Admin
      permissions: {
        create: data.permissions.map(p => ({ permission: p }))
      }
    } as any
  });

  revalidatePath("/dashboard/admin/users");
  return newUser;
}

export async function updateAdminPermissions(userId: string, permissions: string[]) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'SUPER_ADMIN') throw new Error("Unauthorized");

  // First delete all existing permissions
  await (db as any).adminPermission.deleteMany({
    where: { userId }
  });

  // Then create new ones
  await (db as any).adminPermission.createMany({
    data: permissions.map(p => ({ userId, permission: p }))
  });

  revalidatePath("/dashboard/admin/users");
}
