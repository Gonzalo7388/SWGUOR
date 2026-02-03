"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Save, AlertCircle, CheckCircle2, Shield, Calendar, Camera, Eye, EyeOff, Mail, Phone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { updateUsuario, getUsuarioData } from "@/lib/helpers/usuario-helpers";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsuarioData {
  nombre_completo: string;
  email: string;
  telefono: string | null;
  avatar_url: string | null;
  created_at: string;
  ultimo_acceso: string | null;
}

export default function PerfilPage() {
  const { usuario, isLoading: loadingPermisos } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Datos del perfil
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Cambio de contraseña
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (usuario?.id) {
      loadUserData();
    }
  }, [usuario]);

  const loadUserData = async () => {
    if (!usuario?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await getUsuarioData(usuario.id);

      if (error) throw error;

      if (data) {
        const userData = data as UsuarioData;
        setNombreCompleto(userData.nombre_completo || "");
        setEmail(userData.email || "");
        setTelefono(userData.telefono || "");
        setAvatarUrl(userData.avatar_url || "");
      }
    } catch (err: any) {
      console.error("Error cargando datos del usuario:", err);
      setError("Error al cargar los datos del perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario?.id) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no debe superar los 2MB");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      const supabase = getSupabaseBrowserClient();

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${usuario.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir imagen a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar base de datos usando el helper
      const { error: updateError } = await updateUsuario(usuario.id, {
        avatar_url: publicUrl
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSuccess("Foto de perfil actualizada correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error subiendo imagen:", err);
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id) return;
    
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = getSupabaseBrowserClient();

      // Validaciones
      if (!nombreCompleto.trim()) {
        setError("El nombre completo es obligatorio");
        setIsSaving(false);
        return;
      }

      // Validar email si es administrador y cambió el email
      const isAdmin = usuario?.rol?.toLowerCase() === 'administrador';
      const emailChanged = email.trim() && email.trim().toLowerCase() !== usuario.email?.toLowerCase();
      
      if (isAdmin && emailChanged) {
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError("El formato del email no es válido");
          setIsSaving(false);
          return;
        }

        // Actualizar email en Supabase Auth
        const { error: authError } = await supabase.auth.updateUser({
          email: email.trim().toLowerCase(),
        });

        if (authError) {
          setError("Error al actualizar el email: " + authError.message);
          setIsSaving(false);
          return;
        }
      }

      // Preparar datos para actualizar
      const updateData: Record<string, any> = {
        nombre_completo: nombreCompleto.trim(),
        telefono: telefono.trim() || null,
      };

      // Si es admin y cambió el email, también actualizar en la tabla
      if (isAdmin && emailChanged) {
        updateData.email = email.trim().toLowerCase();
      }

      // Actualizar usando el helper
      const { error: updateError } = await updateUsuario(usuario.id, updateData);

      if (updateError) throw updateError;

      setSuccess(
        isAdmin && emailChanged
          ? "Perfil actualizado. Revisa tu nuevo email para confirmar el cambio."
          : "Perfil actualizado correctamente"
      );
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error("Error actualizando perfil:", err);
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = getSupabaseBrowserClient();

      // Validaciones
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Todos los campos de contraseña son obligatorios");
        setIsSaving(false);
        return;
      }

      if (newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres");
        setIsSaving(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        setIsSaving(false);
        return;
      }

      // Verificar contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPassword,
      });

      if (signInError) {
        setError("La contraseña actual es incorrecta");
        setIsSaving(false);
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error cambiando contraseña:", err);
      setError(err.message || "Error al cambiar la contraseña");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingPermisos || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 via-pink-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 via-pink-50 to-red-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h1>
          <p className="text-gray-600">Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-pink-50 to-red-50 p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Mi Perfil
          </h1>
          <p className="text-gray-600 text-base md:text-lg font-medium">
            Administra tu información personal y configuración de cuenta
          </p>  
        </div>

        {/* Alertas */}
        {success && (
          <Alert className="mb-6 bg-emerald-50 border-2 border-emerald-200 shadow-lg animate-in slide-in-from-top">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium ml-2">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-2 border-red-200 shadow-lg animate-in slide-in-from-top">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium ml-2">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card de Información del Usuario */}
          <Card className="lg:col-span-1 shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-linear-to-br from-pink-500 via-red-500 to-pink-600 h-32"></div>
            <CardContent className="relative -mt-16 pb-8">
              {/* Avatar con opción de cambio */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-pink-100"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-linear-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-2xl ring-4 ring-pink-100">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  
                  {/* Botón de cambiar foto */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 w-12 h-12 bg-linear-to-r from-pink-500 to-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:from-pink-600 hover:to-red-700 transition-all hover:scale-110 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed group-hover:ring-4 ring-pink-200"
                  >
                    {uploadingImage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <h3 className="font-black text-2xl text-gray-900 text-center mt-4 mb-1 tracking-tight">
                  {nombreCompleto}
                </h3>
                <p className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {email}
                </p>
                {telefono && (
                  <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {telefono}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Rol</p>
                    <p className="font-bold text-gray-900 capitalize">{usuario.rol?.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Estado</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {usuario.estado}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">
                        Miembro desde
                      </span>
                      <span className="text-sm font-black text-gray-800">
                        {usuario.created_at 
                          ? new Date(usuario.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Sin fecha'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formularios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Personales */}
            <Card className="shadow-xl border-2 border-gray-100">
              <CardHeader className="pb-3 bg-linear-to-r from-pink-50 to-red-50 border-b-2 border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <CardTitle className="text-2xl font-black">
                      Datos Personales
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      Actualiza tu información personal
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombreCompleto" className="text-sm font-bold text-gray-700">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombreCompleto"
                      type="text"
                      placeholder="Juan Pérez García"
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      required
                      disabled={isSaving}
                      className="h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-gray-700">
                      Email Corporativo
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={usuario?.rol?.toLowerCase() !== 'administrador' || isSaving}
                      className={cn(
                        "h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500",
                        usuario?.rol?.toLowerCase() !== 'administrador' && "bg-gray-100 cursor-not-allowed"
                      )}
                    />
                    <p className="text-xs text-gray-500 font-medium">
                      {usuario?.rol?.toLowerCase() === 'administrador' 
                        ? "Como administrador, puedes cambiar tu email corporativo."
                        : "El email no se puede modificar. Contacta al administrador si necesitas cambiarlo."
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-bold text-gray-700">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+51 987 654 321"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      disabled={isSaving}
                      className="h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-linear-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cambiar Contraseña */}
            <Card className="shadow-xl border-2 border-gray-100">
              <CardHeader className="pb-3 bg-linear-to-r from-pink-50 to-red-50 border-b-2 border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <CardTitle className="text-2xl font-black">
                      Seguridad
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      Cambia tu contraseña para mantener tu cuenta segura
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!showPasswordSection ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordSection(true)}
                    className="w-full h-14 text-base font-bold border-2 border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Cambiar Contraseña
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    {/* Contraseña Actual */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-bold text-gray-700">
                        Contraseña Actual <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          disabled={isSaving}
                          className="h-12 pr-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Nueva Contraseña */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-bold text-gray-700">
                        Nueva Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={isSaving}
                          className="h-12 pr-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        Mínimo 6 caracteres
                      </p>
                    </div>

                    {/* Confirmar Nueva Contraseña */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">
                        Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isSaving}
                          className="h-12 pr-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setError("");
                        }}
                        disabled={isSaving}
                        className="flex-1 h-12 border-2 border-gray-200 font-bold hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-linear-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Actualizar
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}