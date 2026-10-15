package uy.edu.ort.battleshipdemo.modelo;

/**
 * Estados posibles de una batalla.
 * Provisorio: cuando se vea polimorfismo en clase se evaluará si conviene
 * reemplazarlo por clases (cada estado decide qué acciones permite).
 */
public enum EstadoBatalla {
    EN_PREPARACION,   // sin barcos posicionados o posicionándolos (CU02)
    EN_COMBATE,       // se están jugando rondas (CU03)
    GANADA,
    PERDIDA
}
