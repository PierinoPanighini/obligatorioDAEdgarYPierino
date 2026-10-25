package uy.edu.ort.battleshipdemo.modelo;

import java.util.ArrayList;
import java.util.List;

public class Oceano {

    private int filas;
    private int columnas;
    private Cuadrante[][] cuadrantes;

    public Oceano(int filas, int columnas) {
        if (filas < 6 || filas > 12 || columnas < 6 || columnas > 12) {
            throw new IllegalArgumentException("Las filas y columnas deben estar entre 6 y 12."); // FIXME: CHEQUEAR
                                                                                                  // EXCEPCION
        }

        this.filas = filas;
        this.columnas = columnas;
        this.cuadrantes = new Cuadrante[filas][columnas];

        for (int fila = 0; fila < filas; fila++) {
            for (int columna = 0; columna < columnas; columna++) {
                this.cuadrantes[fila][columna] = new Cuadrante(fila, columna);
            }
        }
    }

    public int getFilas() {
        return filas;
    }

    public int getColumnas() {
        return columnas;
    }

    public Cuadrante getCuadrante(int fila, int columna) {
        if (!estaDentro(fila, columna)) {
            throw new IllegalArgumentException("Las coordenadas estan fuera del oceano.");//
            // cambiè el if para usar el metodo estaDentro
            // FIXME: CHEQUEAR EXCEPCION
        }

        return cuadrantes[fila][columna];
    }

    public boolean estaDentro(int fila, int columna) {
        return fila >= 0 && fila < filas && columna >= 0 && columna < columnas;
    }

    public void ubicar(Barco barco, int fila, int columna, Orientacion orientacion) throws BatallaNavalException {
        List<Cuadrante> lugar = new ArrayList<>();
        for (int i = 0; i < barco.getTamanio(); i++) {
            int f = fila;
            int c = columna;
            if (orientacion == Orientacion.HORIZONTAL) {
                c += i; // el barco siempre crece hacia la derecha si es horizontal
            } else {
                f += i;// el barco siempre crece hacia arriba si es vertical
            }
            if (!estaDentro(f, c)) {// si el barco queda fuera del oceano.
                throw new BatallaNavalException("El barco queda fuera del océano");
            }
            if (hayBarcoCerca(f, c)) {// si hay un barco pegado o superpuesto.
                throw new BatallaNavalException("El barco no puede tocar ni superponerse con otro barco");
            }
            lugar.add(cuadrantes[f][c]);// agrego a la lista de cuadrantes que ocupará el barco
        }
        barco.ubicar(lugar, orientacion); // si todo estuvo bien ubico el barco en los cuadrantes correspondientes

    }

    private boolean hayBarcoCerca(int fila, int columna) {
        for (int f = fila - 1; f <= fila + 1; f++) {
            for (int c = columna - 1; c <= columna + 1; c++) {
                if (estaDentro(f, c) && cuadrantes[f][c].estaOcupado()) {
                    return true; // corto la busqueda si hay barco cerca.
                }
            }
        }
        return false; // devuelvo falso si no hay barco cerca.
    }

}
