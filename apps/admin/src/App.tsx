import { Routes, Route } from 'react-router-dom';
import { Card, Button } from '@obrix/ui';
import { LayoutDashboard, Users, FolderKanban, Bug } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Obrix Admin Dashboard</h1>
          <p className="text-gray-400">Gestión completa de proyectos de construcción</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card neon>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Proyectos Activos</p>
                <p className="text-3xl font-bold text-white">12</p>
              </div>
              <LayoutDashboard className="w-8 h-8 text-[#00FFA3]" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Usuarios</p>
                <p className="text-3xl font-bold text-white">48</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Tareas Pendientes</p>
                <p className="text-3xl font-bold text-white">127</p>
              </div>
              <FolderKanban className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Bugs Reportados</p>
                <p className="text-3xl font-bold text-white">5</p>
              </div>
              <Bug className="w-8 h-8 text-red-400" />
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-white mb-4">Navegación</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Dashboard</Button>
            <Button variant="secondary">Usuarios</Button>
            <Button variant="secondary">Proyectos</Button>
            <Button variant="secondary">Tareas</Button>
            <Button variant="secondary">Bugs</Button>
            <Button variant="secondary">Reportes</Button>
            <Button variant="secondary">Configuración</Button>
            <Button variant="ghost">Cerrar Sesión</Button>
          </div>
        </Card>

        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">Estado del Sistema</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Base de Datos</span>
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">Activo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Autenticación</span>
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">Activo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Funciones</span>
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm">Activo</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
