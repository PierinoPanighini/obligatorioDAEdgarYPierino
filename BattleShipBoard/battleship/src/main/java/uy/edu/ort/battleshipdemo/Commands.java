package uy.edu.ort.battleshipdemo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import lombok.Getter;

public class Commands {
    
    @Getter
    private List<Command> commands;
    
    private Commands(List<Command> commands) {
        this.commands = new ArrayList<>(commands);
    }
    
    /**
     * Crea un Commands con cero o más comandos iniciales
     * @param commands Comandos iniciales (puede ser vacío)
     * @return Nueva instancia de Commands
     */
    public static Commands create(Command... commands) {
        return new Commands(Arrays.asList(commands));
    }
    
    /**
     * Agrega un comando al conjunto
     * @param command Comando a agregar
     * @return Esta instancia (fluent API)
     */
    public Commands add(Command command) {
        this.commands.add(command);
        return this;
    }
    
    /**
     * Agrega múltiples comandos al conjunto
     * @param commands Comandos a agregar
     * @return Esta instancia (fluent API)
     */
    public Commands add(Command... commands) {
        this.commands.addAll(Arrays.asList(commands));
        return this;
    }
}
