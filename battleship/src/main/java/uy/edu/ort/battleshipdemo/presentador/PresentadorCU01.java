package uy.edu.ort.battleshipdemo.presentador;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import uy.edu.ort.battleshipdemo.modelo.Fachada;

@RestController
@RequestMapping("/cu01")
public class PresentadorCU01 {

    // TODO: conectar con la instancia compartida de Fachada cuando este configurada.
    private Fachada fachada;

    @PostMapping("/inicializar")
    public Commands inicializar() {
        // TODO: preparar los comandos del listado y las estadisticas.
        return Commands.create();
    }

    @PostMapping("/iniciarNuevaBatalla")
    public Commands iniciarNuevaBatalla() {
        // TODO: preparar el comando para mostrar la preparacion de una batalla.
        return Commands.create();
    }

    @PostMapping("/entrarBatalla")
    public Commands entrarBatalla(@RequestParam("id") int id) {
        // TODO: buscar la batalla y preparar los comandos segun su estado.
        return Commands.create();
    }
}
