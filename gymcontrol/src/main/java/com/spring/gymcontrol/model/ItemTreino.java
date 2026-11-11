package com.spring.gymcontrol.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "itens_treino")
public class ItemTreino {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "treino_id")
    private Treino treino;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercicio_id")
    private Exercicio exercicio;

    private Integer series;
    private Integer repeticoes;

    @Column(precision = 6, scale = 2)
    private BigDecimal carga;

    private Integer ordem;
}