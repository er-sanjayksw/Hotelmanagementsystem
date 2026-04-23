"use client";

import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const revenueData = [
  { name: 'Mon', revenue: 2400 },
  { name: 'Tue', revenue: 1398 },
  { name: 'Wed', revenue: 9800 },
  { name: 'Thu', revenue: 3908 },
  { name: 'Fri', revenue: 4800 },
  { name: 'Sat', revenue: 3800 },
  { name: 'Sun', revenue: 4300 },
];

const occupancyData = [
  { name: 'Standard', value: 85, color: '#6366f1' },
  { name: 'Deluxe', value: 62, color: '#8b5cf6' },
  { name: 'Suite', value: 45, color: '#ec4899' },
  { name: 'Penthouse', value: 30, color: '#f43f5e' },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      {/* Revenue Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Revenue Performance</h3>
            <p className="text-sm text-slate-500">Weekly financial overview</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-600">$32,480</span>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">+12.5% from last week</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupancy Chart */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Occupancy by Category</h3>
            <p className="text-sm text-slate-500">Current room distribution</p>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancyData} layout="vertical" barSize={32}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                width={100}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
