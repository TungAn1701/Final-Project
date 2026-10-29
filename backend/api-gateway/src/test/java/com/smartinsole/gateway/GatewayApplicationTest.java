package com.smartinsole.gateway;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GatewayApplicationTest {

    @Test
    @DisplayName("Instantiate GatewayApplication")
    void testAppInstantiation() {
        GatewayApplication app = new GatewayApplication();
        assertNotNull(app);
    }
}
