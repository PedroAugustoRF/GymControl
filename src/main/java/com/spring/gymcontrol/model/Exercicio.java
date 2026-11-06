package com.spring.gymcontrol.model;

import com.spring.gymcontrol.enums.Agrupamento;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "exercicios")
public class Exercicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Agrupamento agrupamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id")
    private Maquina maquina;
}
