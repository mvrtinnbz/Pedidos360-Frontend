import { Injectable, signal, computed } from '@angular/core';

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  imagen: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSignal = signal<ItemCarrito[]>([
    {
      producto: {
        id: 1,
        nombre: 'Camiseta Running Pro',
        categoria: 'Running',
        precio: 19990,
        imagen: '🏃‍♂️'
      },
      cantidad: 1
    },
    {
      producto: {
        id: 2,
        nombre: 'Zapatillas Cushion Max',
        categoria: 'Calzado',
        precio: 69990,
        imagen: '👟'
      },
      cantidad: 1
    }
  ]);

  readonly items = this.itemsSignal.asReadonly();

  readonly total = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  );

  readonly cantidadTotal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.cantidad, 0)
  );

  agregar(producto: Producto): void {
    const actuales = this.itemsSignal();
    const existe = actuales.find((i) => i.producto.id === producto.id);

    if (existe) {
      this.itemsSignal.set(
        actuales.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      this.itemsSignal.set([...actuales, { producto, cantidad: 1 }]);
    }
  }

  cambiarCantidad(productoId: number, cambio: number): void {
    const actuales = this.itemsSignal();
    this.itemsSignal.set(
      actuales
        .map((i) => {
          if (i.producto.id === productoId) {
            const nuevaCantidad = i.cantidad + cambio;
            return nuevaCantidad > 0 ? { ...i, cantidad: nuevaCantidad } : null;
          }
          return i;
        })
        .filter((i): i is ItemCarrito => i !== null)
    );
  }

  eliminar(productoId: number): void {
    this.itemsSignal.set(this.itemsSignal().filter((i) => i.producto.id !== productoId));
  }

  limpiar(): void {
    this.itemsSignal.set([]);
  }
}