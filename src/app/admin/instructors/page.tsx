import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import Image from "next/image";
import DeleteInstructorButton from "./DeleteInstructorButton";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Kadromuz Yönetimi</h1>
        <Link 
          href="/admin/instructors/new" 
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Eğitmen Ekle
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Sıra</th>
                <th className="px-6 py-4 font-medium">Fotoğraf</th>
                <th className="px-6 py-4 font-medium">Eğitmen Bilgisi</th>
                <th className="px-6 py-4 font-medium">Söz / Slogan</th>
                <th className="px-6 py-4 font-medium">Durum</th>
                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instructors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Henüz eğitmen eklenmemiş.
                  </td>
                </tr>
              ) : (
                instructors.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{inst.order}</td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative bg-gray-100 border">
                        {inst.image && (
                          <Image src={inst.image} alt={inst.name} fill className="object-cover" unoptimized />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{inst.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{inst.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 line-clamp-1 max-w-[250px]">{inst.quote || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        inst.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {inst.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/instructors/${inst.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <DeleteInstructorButton id={inst.id} name={inst.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
