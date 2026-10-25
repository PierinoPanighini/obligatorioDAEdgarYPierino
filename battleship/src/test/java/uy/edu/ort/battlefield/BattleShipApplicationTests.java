package uy.edu.ort.battlefield;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import uy.edu.ort.battleshipdemo.BattleShipApplication;
import uy.edu.ort.battleshipdemo.modelo.SistemaBatallas;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = BattleShipApplication.class)
class BattleShipApplicationTests {

    @Autowired
    private SistemaBatallas sistema;

	@Test
	void contextLoads() {
        assertEquals(4, sistema.listarBatallas().size());
        assertEquals(5, sistema.listarTiposBarco().size());
        assertEquals(3, sistema.listarTacticas().size());
    }

}
