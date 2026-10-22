package com.smartinsole.customer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String phoneNumber;

    @Column(nullable = false)
    private int age;

    @Column(length = 20)
    private String gender;

    @Column(nullable = false)
    private double shoeSizeEu;

    @Column(nullable = false)
    private double weightKg;

    @Column(nullable = false)
    private double heightCm;

    @Column(length = 255)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String medicalNotes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GaitSessionEntity> sessions = new ArrayList<>();
}
