package com.example.predictionmachine.data;

import com.example.predictionmachine.core.Tick;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CsvTickConnectorTest {

    @Test
    void bundledSampleLoadsSortedAndHalfOpenWindowWorks() {
        CsvTickConnector c = CsvTickConnector.fromClasspath("/sample/ticks.csv");
        List<Tick> all = c.fetch(Instant.EPOCH, Instant.MAX);
        assertEquals(3000, all.size());
        for (int i = 1; i < all.size(); i++) {
            assertTrue(all.get(i).timestamp().isAfter(all.get(i - 1).timestamp()));
        }
        Instant second = all.get(1).timestamp();
        assertEquals(1, c.fetch(all.get(0).timestamp(), second).size()); // end is exclusive
    }
}
