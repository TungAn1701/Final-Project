package com.smartinsole.customer.controller;

import com.smartinsole.common.dto.CustomerDto;
import com.smartinsole.customer.entity.CustomerEntity;
import com.smartinsole.customer.repository.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    private CustomerDto toDto(CustomerEntity e) {
        return CustomerDto.builder()
                .id(e.getId())
                .fullName(e.getFullName())
                .email(e.getEmail())
                .phoneNumber(e.getPhoneNumber())
                .age(e.getAge())
                .gender(e.getGender())
                .shoeSizeEu(e.getShoeSizeEu())
                .weightKg(e.getWeightKg())
                .heightCm(e.getHeightCm())
                .address(e.getAddress())
                .medicalNotes(e.getMedicalNotes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    // 1. Create Customer Profile
    @PostMapping({"/api/v1/customers", "/api/v1/patients"})
    public ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto dto) {
        CustomerEntity entity = CustomerEntity.builder()
                .id(dto.getId() != null ? dto.getId() : UUID.randomUUID().toString())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .age(dto.getAge())
                .gender(dto.getGender() != null ? dto.getGender() : "other")
                .shoeSizeEu(dto.getShoeSizeEu() > 0 ? dto.getShoeSizeEu() : 40.0)
                .weightKg(dto.getWeightKg() > 0 ? dto.getWeightKg() : 65.0)
                .heightCm(dto.getHeightCm() > 0 ? dto.getHeightCm() : 170.0)
                .address(dto.getAddress())
                .medicalNotes(dto.getMedicalNotes())
                .build();

        CustomerEntity saved = customerRepository.save(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    // 2. List & Search Customers
    @GetMapping({"/api/v1/customers", "/api/v1/patients"})
    public ResponseEntity<List<CustomerDto>> listCustomers(@RequestParam(required = false) String search) {
        List<CustomerEntity> list;
        if (search != null && !search.trim().isEmpty()) {
            list = customerRepository.searchCustomers(search.trim());
        } else {
            list = customerRepository.findAll();
        }
        return ResponseEntity.ok(list.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // 3. Get Customer by ID
    @GetMapping({"/api/v1/customers/{id}", "/api/v1/patients/{id}"})
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable String id) {
        return customerRepository.findById(id)
                .map(c -> ResponseEntity.ok(toDto(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Update Customer Profile
    @PutMapping({"/api/v1/customers/{id}", "/api/v1/patients/{id}"})
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable String id, @RequestBody CustomerDto dto) {
        return customerRepository.findById(id).map(existing -> {
            if (dto.getFullName() != null) existing.setFullName(dto.getFullName());
            if (dto.getEmail() != null) existing.setEmail(dto.getEmail());
            if (dto.getPhoneNumber() != null) existing.setPhoneNumber(dto.getPhoneNumber());
            if (dto.getAge() > 0) existing.setAge(dto.getAge());
            if (dto.getGender() != null) existing.setGender(dto.getGender());
            if (dto.getShoeSizeEu() > 0) existing.setShoeSizeEu(dto.getShoeSizeEu());
            if (dto.getWeightKg() > 0) existing.setWeightKg(dto.getWeightKg());
            if (dto.getHeightCm() > 0) existing.setHeightCm(dto.getHeightCm());
            if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
            if (dto.getMedicalNotes() != null) existing.setMedicalNotes(dto.getMedicalNotes());

            CustomerEntity updated = customerRepository.save(existing);
            return ResponseEntity.ok(toDto(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. Delete Customer
    @DeleteMapping({"/api/v1/customers/{id}", "/api/v1/patients/{id}"})
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
