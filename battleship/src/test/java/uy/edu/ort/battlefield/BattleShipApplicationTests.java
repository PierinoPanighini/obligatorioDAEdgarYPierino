package uy.edu.ort.battlefield;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import uy.edu.ort.battleshipdemo.BattleShipApplication;
import uy.edu.ort.battleshipdemo.modelo.Fachada;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = BattleShipApplication.class)
class BattleShipApplicationTests {

    @Autowired
    private Fachada fachada;

	@Test
	void contextLoads() {
        assertEquals(4, fachada.listarBatallas().size());
        assertEquals(5, fachada.listarTiposBarco().size());
        assertEquals(3, fachada.listarTacticas().size());
    }

}
