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

const STORAGE_KEY = 'pedidos360_carrito_local';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private itemsSignal = signal<ItemCarrito[]>(this.cargarDesdeStorage());

  readonly items = this.itemsSignal.asReadonly();

  readonly total = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0)
  );

  readonly cantidadTotal = computed(() =>
    this.itemsSignal().reduce((acc, item) => acc + item.cantidad, 0)
  );

  private cargarDesdeStorage(): ItemCarrito[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private guardarEnStorage(items: ItemCarrito[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  agregar(producto: Producto): void {
    const actuales = this.itemsSignal();
    const existe = actuales.find((i) => i.producto.id === producto.id);

    const nuevos = existe
      ? actuales.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      : [...actuales, { producto, cantidad: 1 }];

    this.itemsSignal.set(nuevos);
    this.guardarEnStorage(nuevos);
  }

  cambiarCantidad(productoId: number, cambio: number): void {
    const nuevos = this.itemsSignal()
      .map((i) => {
        if (i.producto.id === productoId) {
          const nuevaCantidad = i.cantidad + cambio;
          return nuevaCantidad > 0 ? { ...i, cantidad: nuevaCantidad } : null;
        }
        return i;
      })
      .filter((i): i is ItemCarrito => i !== null);

    this.itemsSignal.set(nuevos);
    this.guardarEnStorage(nuevos);
  }

  eliminar(productoId: number): void {
    const nuevos = this.itemsSignal().filter((i) => i.producto.id !== productoId);
    this.itemsSignal.set(nuevos);
    this.guardarEnStorage(nuevos);
  }

  limpiar(): void {
    this.itemsSignal.set([]);
    this.guardarEnStorage([]);
  }
}