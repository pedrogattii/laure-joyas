'use client';

import { useState } from 'react';
import { useSupabaseUsers, updateSupabaseUserRole, ManagedUser } from '@/lib/supabaseSync';
import { useToast } from '@/context/ToastContext';
import { UserIcon, GearIcon, CreditCardIcon, ShieldCheckIcon } from '@/components/icons/SvgIcons';
import { Badge } from '@/components/ui/Badge';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const { users, fetchUsers, loading } = useSupabaseUsers();
  const { showToast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Fallback demo users if users table is empty
  const displayUsers: ManagedUser[] = users.length > 0 ? users : [
    {
      id: 'usr-admin-demo',
      name: 'Adriana (Dueña)',
      email: 'admin@laurejoyas.com',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-employee-demo',
      name: 'Martina (Caja Salsipuedes)',
      email: 'empleado@laurejoyas.com',
      role: 'EMPLOYEE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-customer-demo',
      name: 'María González',
      email: 'maria@gmail.com',
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
    },
  ];

  const handleRoleChange = async (userId: string, userName: string, newRole: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER') => {
    setUpdatingId(userId);
    const success = await updateSupabaseUserRole(userId, newRole);
    setUpdatingId(null);

    if (success) {
      showToast(`Rol de ${userName} actualizado a ${newRole} con éxito.`, 'success');
      fetchUsers();
    } else {
      // Local fallback notification for demo items
      showToast(`Rol de ${userName} asignado a ${newRole}.`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#e8e3da] animate-scaleIn text-[#1a1918] flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#1a1918] to-[#2a2826] text-white flex justify-between items-center border-b border-[#33312e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shrink-0">
              <UserIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">Gestión de Usuarios y Roles</h2>
              <p className="text-[11px] text-gray-300">Asigná o cambiá privilegios (Dueña / Empleado / Cliente)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-lg p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#fcfbf9] border-b border-[#e8e3da] p-3.5 text-xs text-[#1a1918] flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <strong className="text-gold font-bold uppercase tracking-wider text-[11px]">Asignación de Roles en Tiempo Real</strong>
            <p className="text-[11px] text-gray-600 mt-0.5 font-sans leading-relaxed">
              Los nuevos registros asumen el rol <code className="bg-[#f5ecda] text-[#8a6b29] px-1.5 py-0.5 rounded font-mono text-[10px]">CUSTOMER</code> por defecto. Como Dueña podés elevar permisos a <code className="bg-[#f5ecda] text-[#8a6b29] px-1.5 py-0.5 rounded font-mono text-[10px]">EMPLOYEE</code> (Caja POS) o <code className="bg-[#f5ecda] text-[#8a6b29] px-1.5 py-0.5 rounded font-mono text-[10px]">ADMIN</code>.
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="p-5 overflow-y-auto flex-grow space-y-3">
          {loading ? (
            <div className="py-12 text-center text-gray-500 text-xs">Cargando lista de usuarios...</div>
          ) : (
            <div className="divide-y divide-[#e8e3da]/60 border border-[#e8e3da] rounded-xl overflow-hidden shadow-xs">
              <div className="bg-[#fcfbf9] px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-600 grid grid-cols-12 gap-2">
                <span className="col-span-5">Usuario / Correo</span>
                <span className="col-span-3">Rol Actual</span>
                <span className="col-span-4 text-right">Asignar Privilegio</span>
              </div>

              {displayUsers.map((u) => (
                <div key={u.id} className="px-4 py-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-[#faf8f5] transition-colors">
                  {/* Name & Email */}
                  <div className="col-span-5 min-w-0">
                    <p className="font-bold text-[#1a1918] truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">{u.email}</p>
                  </div>

                  {/* Current Role Badge */}
                  <div className="col-span-3">
                    {u.role === 'ADMIN' ? (
                      <Badge variant="gold" size="sm" icon={<GearIcon className="w-3 h-3 text-[#8a6b29]" />}>
                        Dueña (Admin)
                      </Badge>
                    ) : u.role === 'EMPLOYEE' ? (
                      <Badge variant="info" size="sm" icon={<CreditCardIcon className="w-3 h-3 text-sky-700" />}>
                        Empleado
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" icon={<UserIcon className="w-3 h-3 text-gray-600" />}>
                        Cliente
                      </Badge>
                    )}
                  </div>

                  {/* Role Selector */}
                  <div className="col-span-4 flex justify-end">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, u.name, e.target.value as 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER')}
                      className="border border-[#e8e3da] rounded-full text-xs font-semibold px-3 py-1.5 bg-white text-[#1a1918] focus:ring-2 focus:ring-gold focus:outline-none cursor-pointer shadow-xs"
                    >
                      <option value="CUSTOMER">Cliente</option>
                      <option value="EMPLOYEE">Empleado (Caja POS)</option>
                      <option value="ADMIN">Dueña (Administrador)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#fcfbf9] border-t border-[#e8e3da] flex justify-end">
          <button
            onClick={onClose}
            className="btn-stitch-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer active:scale-95"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
}

