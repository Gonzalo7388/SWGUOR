# Guía de Estructura Ecommerce - SWGUOR

## Estructura Reorganizada

### Componentes (`_components`)
```
_components/
├── layout/           # Header y Footer
│   ├── Header.tsx
│   └── Footer.tsx
├── hero/             # Secciones hero/carrusel
│   └── HeroSlider.tsx
├── productos/        # Componentes de productos
│   └── FeaturedProducts.tsx
└── secciones/        # Secciones informativas
    ├── CategoryShowcase.tsx
    ├── PromoSection.tsx
    └── BenefitsSection.tsx
```

### Context (`_contexts`)
```
_contexts/
└── AuthContext.tsx   # Proveedor de autenticación y datos globales
```

### API (`app/api/ecommerce`)
```
api/ecommerce/
└── productos/
    └── route.ts      # Endpoint GET /api/ecommerce/productos
```

## Cómo Usar

### 1. Usar el Context de Autenticación
```tsx
'use client';

import { useEcommerce } from '@/app/ecommerce/_contexts/AuthContext';

export default function MiComponente() {
  const { user, session, loading, signOut } = useEcommerce();
  
  return (
    <div>
      {loading ? <p>Cargando...</p> : <p>Usuario: {user?.email}</p>}
    </div>
  );
}
```

### 2. Obtener Productos desde BD
```tsx
'use client';

import { useProductosEcommerce } from '@/lib/hooks/useProductosEcommerce';

export default function ListaProductos() {
  const { productos, loading, error } = useProductosEcommerce({
    limite: 20,
    categoria: 'vestidos',
    busqueda: 'floral'
  });

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {productos.map(p => (
        <div key={p.id}>{p.nombre}</div>
      ))}
    </div>
  );
}
```

### 3. Llamar API de Productos Directamente
```tsx
const response = await fetch('/api/ecommerce/productos?categoria=1&limite=10');
const data = await response.json();
console.log(data.data); // Array de productos
```

### 4. Usar Funciones de Supabase
```tsx
import { getProductos, getProductosPorCategoria, buscarProductos } from '@/lib/supabase';

// Obtener todos
const todos = await getProductos();

// Por categoría
const vestidos = await getProductosPorCategoria('1');

// Buscar
const resultados = await buscarProductos('rosa');
```

## Próximos Pasos

1. **Actualizar FeaturedProducts.tsx** para usar `useProductosEcommerce` en lugar de datos hardcodeados
2. **Crear componentes** para carrito, checkout con el context
3. **Agregar filtros** en CategoryShowcase usando la API
4. **Implementar búsqueda** usando `buscarProductos()`

## Notas Importantes

- El **Context** (EcommerceProvider) envuelve todo en `layout.tsx`
- Todos los componentes que necesiten user/auth deben usar `useEcommerce()`
- La **API** reutiliza la estructura existente (sin duplicar carpetas admin)
- Los **productos** se obtienen de la tabla `productos` en Supabase
