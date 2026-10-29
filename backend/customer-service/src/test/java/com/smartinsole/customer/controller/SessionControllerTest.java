package com.smartinsole.customer.controller;

import com.smartinsole.common.dto.GaitSessionDto;
import com.smartinsole.customer.entity.CustomerEntity;
import com.smartinsole.customer.entity.GaitSessionEntity;
import com.smartinsole.customer.repository.CustomerRepository;
import com.smartinsole.customer.repository.GaitSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionControllerTest {

    @Mock
    private GaitSessionRepository sessionRepository;

    @Mock
    private CustomerRepository customerRepository;

    private SessionController controller;

    @BeforeEach
    void setUp() {
        controller = new SessionController(sessionRepository, customerRepository);
    }

    private CustomerEntity createCustomer(String id) {
        return CustomerEntity.builder().id(id).fullName("Patient A").build();
    }

    private GaitSessionEntity createSession(String id, CustomerEntity customer) {
        return GaitSessionEntity.builder()
                .id(id)
                .customer(customer)
                .deviceMac("AA:BB:CC:11:22:33")
                .activityType("walking")
                .stepCount(45)
                .status("RECORDING")
                .notes("Clinical test")
                .startTime(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Create session for valid customer")
    void testCreateSessionSuccess() {
        CustomerEntity customer = createCustomer("cust-1");
        when(customerRepository.findById("cust-1")).thenReturn(Optional.of(customer));

        GaitSessionEntity session = createSession("sess-1", customer);
        when(sessionRepository.save(any(GaitSessionEntity.class))).thenReturn(session);

        GaitSessionDto req = GaitSessionDto.builder()
                .customerId("cust-1")
                .deviceMac("AA:BB:CC:11:22:33")
                .activityType("walking")
                .build();

        ResponseEntity<GaitSessionDto> resp = controller.createSession(req);
        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("sess-1", resp.getBody().getId());
        assertEquals("cust-1", resp.getBody().getCustomerId());
    }

    @Test
    @DisplayName("Create session fails if customer not found")
    void testCreateSessionCustomerNotFound() {
        when(customerRepository.findById("cust-missing")).thenReturn(Optional.empty());

        GaitSessionDto req = GaitSessionDto.builder().customerId("cust-missing").build();
        ResponseEntity<GaitSessionDto> resp = controller.createSession(req);

        assertEquals(HttpStatus.NOT_FOUND, resp.getStatusCode());
    }

    @Test
    @DisplayName("Get session by ID: found and not found")
    void testGetSession() {
        CustomerEntity customer = createCustomer("cust-1");
        GaitSessionEntity session = createSession("sess-1", customer);

        when(sessionRepository.findById("sess-1")).thenReturn(Optional.of(session));
        when(sessionRepository.findById("sess-missing")).thenReturn(Optional.empty());

        ResponseEntity<GaitSessionDto> found = controller.getSession("sess-1");
        assertEquals(HttpStatus.OK, found.getStatusCode());
        assertEquals("sess-1", found.getBody().getId());

        ResponseEntity<GaitSessionDto> notFound = controller.getSession("sess-missing");
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
    }

    @Test
    @DisplayName("Complete session sets COMPLETED status and endTime")
    void testCompleteSession() {
        CustomerEntity customer = createCustomer("cust-1");
        GaitSessionEntity session = createSession("sess-1", customer);

        when(sessionRepository.findById("sess-1")).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(GaitSessionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<GaitSessionDto> resp = controller.completeSession("sess-1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("COMPLETED", resp.getBody().getStatus());
        assertNotNull(resp.getBody().getEndTime());

        when(sessionRepository.findById("sess-unknown")).thenReturn(Optional.empty());
        ResponseEntity<GaitSessionDto> notFound = controller.completeSession("sess-unknown");
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
    }

    @Test
    @DisplayName("List customer sessions and list all sessions")
    void testListSessions() {
        CustomerEntity customer = createCustomer("c1");
        GaitSessionEntity s1 = createSession("s1", customer);
        GaitSessionEntity s2 = createSession("s2", customer);

        when(sessionRepository.findByCustomerIdOrderByCreatedAtDesc("c1")).thenReturn(List.of(s1, s2));
        ResponseEntity<List<GaitSessionDto>> custResp = controller.listCustomerSessions("c1");
        assertEquals(2, custResp.getBody().size());

        when(sessionRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(s1, s2));
        ResponseEntity<List<GaitSessionDto>> allResp = controller.listAllSessions();
        assertEquals(2, allResp.getBody().size());
    }
}
