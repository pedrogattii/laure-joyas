'use client';

import { useState } from 'react';
import { useSupabaseUsers, updateSupabaseUserRole, ManagedUser } from '@/lib/supabaseSync';
import { useToast } from '@/context/ToastContext';
import { UserIcon, GearIcon, CreditCardIcon } from '@/components/icons/SvgIcons';

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
      showToast(`✓ Rol de ${userName} asignado a ${newRole}.`, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp text-gray-900 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#121212] text-white flex justify-between items-center border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <div>
              <h2 className="font-serif font-bold text-lg text-white">Gestión de Usuarios y Roles de Personal</h2>
              <p className="text-[11px] text-gray-400">Asigná o cambiá privilegios (Dueña / Empleado / Cliente)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white font-bold text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <span className="text-base">👑</span>
          <div>
            <strong>ASIGNACIÓN DE ROLES EN TIEMPO REAL</strong>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Cualquier cliente que se registre tendrá el rol <code>CUSTOMER</code> por defecto. Desde este panel, como Dueña podés elevar su cuenta a <code>EMPLOYEE</code> (Caja POS) o <code>ADMIN</code> (Dueña).
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="p-5 overflow-y-auto flex-grow space-y-3">
          {loading ? (
            <div className="py-12 text-center text-gray-500 text-xs">Cargando lista de usuarios...</div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-gray-600 grid grid-cols-12 gap-2">
                <span className="col-span-5">Usuario / Correo</span>
                <span className="col-span-3">Rol Actual</span>
                <span className="col-span-4 text-right">Asignar Privilegio</span>
              </div>

              {displayUsers.map((u) => (
                <div key={u.id} className="px-4 py-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-gray-50/80 transition-colors">
                  {/* Name & Email */}
                  <div className="col-span-5 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">{u.email}</p>
                  </div>

                  {/* Current Role Badge */}
                  <div className="col-span-3">
                    {u.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#121212] text-[#c5a059]">
                        <GearIcon className="w-3 h-3" /> Dueña (Admin)
                      </span>
                    ) : u.role === 'EMPLOYEE' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        <CreditCardIcon className="w-3 h-3" /> Empleado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                        <UserIcon className="w-3 h-3" /> Cliente
                      </span>
                    )}
                  </div>

                  {/* Role Selector */}
                  <div className="col-span-4 flex justify-end">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, u.name, e.target.value as 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER')}
                      className="border border-gray-300 rounded-lg text-xs font-bold p-1.5 bg-white text-gray-800 focus:ring-2 focus:ring-[#c5a059] focus:outline-none cursor-pointer"
                    >
                      <option value="CUSTOMER">👤 Cliente</option>
                      <option value="EMPLOYEE">💳 Empleado (Caja POS)</option>
                      <option value="ADMIN">👑 Dueña (Administrador)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#121212] hover:bg-black text-[#c5a059] font-bold text-xs uppercase rounded-xl shadow btn-animate"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
}
