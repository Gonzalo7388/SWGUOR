export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mi Perfil</h1>
          <p className="text-gray-600 text-lg">
            Gestiona tu información personal y preferencias de compra
          </p>
        </div>

        {/* Grid de Secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta: Información Personal */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-l-4 border-red-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Actualiza tu información:
            </p>
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Nombre completo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Correo electrónico
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Número de teléfono
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Foto de perfil
              </li>
            </ul>
            <button className="w-full bg-linear-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Editar Perfil
            </button>
          </div>

          {/* Tarjeta: Direcciones */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-l-4 border-blue-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                📍
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mis Direcciones</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Gestiona tus direcciones de envío:
            </p>
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Dirección principal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Dirección de facturación
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span> Múltiples direcciones
              </li>
            </ul>
            <button className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Gestionar Direcciones
            </button>
          </div>

          {/* Tarjeta: Mis Pedidos */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-l-4 border-green-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                📦
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mis Pedidos</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Revisa y rastrea tus pedidos:
            </p>
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Historial completo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Rastreo en tiempo real
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Estado de devoluciones
              </li>
            </ul>
            <button className="w-full bg-linear-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Ver Mis Pedidos
            </button>
          </div>

          {/* Tarjeta: Preferencias */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-l-4 border-purple-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                ⚙️
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Preferencias</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Configura tus preferencias:
            </p>
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span> Notificaciones
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span> Ofertas personalizadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-600">✓</span> Privacidad
              </li>
            </ul>
            <button className="w-full bg-linear-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Editar Preferencias
            </button>
          </div>

          {/* Tarjeta: Métodos de Pago */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-l-4 border-orange-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                💳
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Métodos de Pago</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Administra tus métodos de pago:
            </p>
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-orange-600">✓</span> Tarjetas de crédito
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-600">✓</span> Billeteras digitales
              </li>
              <li className="flex items-center gap-2">
                <span className="text-orange-600">✓</span> Transferencias bancarias
              </li>
            </ul>
            <button className="w-full bg-linear-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Gestionar Pagos
            </button>
          </div>

          {/* Tarjeta: Seguridad */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-8 border-l-4 border-red-600">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                🔒
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Protege tu cuenta:
            </p>
            <ul className="space-y-3 mb-6 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Cambiar contraseña
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Verificación en dos pasos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✓</span> Dispositivos conectados
              </li>
            </ul>
            <button className="w-full bg-linear-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Configurar Seguridad
            </button>
          </div>
        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="mt-12 flex justify-center">
          <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-red-600 hover:text-red-600 transition">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
