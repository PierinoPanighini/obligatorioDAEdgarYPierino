package uy.edu.ort.battleshipdemo.modelo;

public class Oceano {

    private int filas;
    private int columnas;
    private Cuadrante[][] cuadrantes;

    public Oceano(int filas, int columnas) {
        if (filas < 6 || filas > 12 || columnas < 6 || columnas > 12) {
            throw new IllegalArgumentException("Las filas y columnas deben estar entre 6 y 12."); //FIXME: CHEQUEAR EXCEPCION
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
        if (fila < 0 || fila >= filas || columna < 0 || columna >= columnas) {
            throw new IllegalArgumentException("Las coordenadas estan fuera del oceano.");//FIXME: CHEQUEAR EXCEPCION
        }

        return cuadrantes[fila][columna];
    }
}
