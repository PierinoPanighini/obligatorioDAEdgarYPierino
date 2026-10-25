package uy.edu.ort.battleshipdemo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import uy.edu.ort.battleshipdemo.modelo.BatallaNavalException;
import uy.edu.ort.battleshipdemo.modelo.Fachada;

@Configuration
public class ConfiguracionBatallaNaval {

    @Bean
    public Fachada fachada() throws BatallaNavalException {
        Fachada fachada = Fachada.getInstancia();
        fachada.cargarDatosIniciales();
        return fachada;
    }
}
