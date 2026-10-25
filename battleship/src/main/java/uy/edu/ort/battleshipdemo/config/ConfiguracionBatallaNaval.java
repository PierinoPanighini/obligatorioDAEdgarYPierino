package uy.edu.ort.battleshipdemo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import uy.edu.ort.battleshipdemo.modelo.BatallaNavalException;
import uy.edu.ort.battleshipdemo.modelo.Precargas;
import uy.edu.ort.battleshipdemo.modelo.SistemaBatallas;

@Configuration
public class ConfiguracionBatallaNaval {

    @Bean
    public SistemaBatallas sistemaBatallas() throws BatallaNavalException {
        SistemaBatallas sistema = new SistemaBatallas();
        Precargas.cargar(sistema);
        return sistema;
    }
}
