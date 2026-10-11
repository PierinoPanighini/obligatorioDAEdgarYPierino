package uy.edu.ort.battleshipdemo;

import lombok.Getter;

/**
 * Representa un comando individual que se envía al frontend.
 * Cada comando tiene un identificador (id) y un parámetro (dato asociado).
 */
public class Command {
    @Getter
    private String id;
    @Getter
    private Object parametro;

    public Command(String id, Object parametro) {
        this.id = id;
        this.parametro = parametro;
    }

    public Command() {
    }
}
