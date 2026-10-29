package com.smartinsole.customer.controller;

import com.smartinsole.common.dto.CustomerDto;
import com.smartinsole.customer.entity.CustomerEntity;
import com.smartinsole.customer.repository.CustomerRepository;
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
class CustomerControllerTest {

    @Mock
    private CustomerRepository customerRepository;

    private CustomerController controller;

    @BeforeEach
    void setUp() {
        controller = new CustomerController(customerRepository);
    }

    private CustomerEntity createSampleEntity(String id, String name) {
        return CustomerEntity.builder()
                .id(id)
                .fullName(name)
                .email("test@example.com")
                .phoneNumber("0912345678")
                .age(28)
                .gender("male")
                .shoeSizeEu(42.0)
                .weightKg(70.0)
                .heightCm(175.0)
                .address("Hanoi")
                .medicalNotes("Flexible Flatfoot")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Create customer profile successfully")
    void testCreateCustomer() {
        CustomerDto req = CustomerDto.builder()
                .fullName("Lê Hoàng Nam")
                .phoneNumber("0903124567")
                .email("nam.le@example.com")
                .age(28)
                .gender("male")
                .shoeSizeEu(42.0)
                .weightKg(74.0)
                .heightCm(175.0)
                .build();

        CustomerEntity saved = createSampleEntity("cust-123", "Lê Hoàng Nam");
        when(customerRepository.save(any(CustomerEntity.class))).thenReturn(saved);

        ResponseEntity<CustomerDto> resp = controller.createCustomer(req);

        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("cust-123", resp.getBody().getId());
        assertEquals("Lê Hoàng Nam", resp.getBody().getFullName());
    }

    @Test
    @DisplayName("List customers with and without keyword search")
    void testListCustomers() {
        CustomerEntity e1 = createSampleEntity("c1", "Nguyen Van A");
        CustomerEntity e2 = createSampleEntity("c2", "Tran Thi B");

        when(customerRepository.findAll()).thenReturn(List.of(e1, e2));
        ResponseEntity<List<CustomerDto>> allResp = controller.listCustomers(null);
        assertEquals(2, allResp.getBody().size());

        when(customerRepository.searchCustomers("Tran")).thenReturn(List.of(e2));
        ResponseEntity<List<CustomerDto>> searchResp = controller.listCustomers("Tran");
        assertEquals(1, searchResp.getBody().size());
        assertEquals("Tran Thi B", searchResp.getBody().get(0).getFullName());
    }

    @Test
    @DisplayName("Get customer by ID: found and not found")
    void testGetCustomer() {
        CustomerEntity e = createSampleEntity("c-found", "Hoang");
        when(customerRepository.findById("c-found")).thenReturn(Optional.of(e));
        when(customerRepository.findById("c-missing")).thenReturn(Optional.empty());

        ResponseEntity<CustomerDto> found = controller.getCustomer("c-found");
        assertEquals(HttpStatus.OK, found.getStatusCode());
        assertEquals("Hoang", found.getBody().getFullName());

        ResponseEntity<CustomerDto> notFound = controller.getCustomer("c-missing");
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
    }

    @Test
    @DisplayName("Update customer profile: found and not found")
    void testUpdateCustomer() {
        CustomerEntity existing = createSampleEntity("c-up", "Old Name");
        when(customerRepository.findById("c-up")).thenReturn(Optional.of(existing));
        when(customerRepository.save(any(CustomerEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerDto updateDto = CustomerDto.builder()
                .fullName("New Name")
                .weightKg(75.0)
                .build();

        ResponseEntity<CustomerDto> resp = controller.updateCustomer("c-up", updateDto);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("New Name", resp.getBody().getFullName());

        when(customerRepository.findById("c-unknown")).thenReturn(Optional.empty());
        ResponseEntity<CustomerDto> notFound = controller.updateCustomer("c-unknown", updateDto);
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
    }

    @Test
    @DisplayName("Delete customer profile: exists and not exists")
    void testDeleteCustomer() {
        when(customerRepository.existsById("c-del")).thenReturn(true);
        doNothing().when(customerRepository).deleteById("c-del");

        ResponseEntity<Void> resp = controller.deleteCustomer("c-del");
        assertEquals(HttpStatus.NO_CONTENT, resp.getStatusCode());
        verify(customerRepository, times(1)).deleteById("c-del");

        when(customerRepository.existsById("c-none")).thenReturn(false);
        ResponseEntity<Void> notFound = controller.deleteCustomer("c-none");
        assertEquals(HttpStatus.NOT_FOUND, notFound.getStatusCode());
    }
}
