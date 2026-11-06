package com.spring.gymcontrol.repository;

import com.spring.gymcontrol.model.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {
}
