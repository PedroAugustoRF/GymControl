package com.spring.gymcontrol.repository;

import com.spring.gymcontrol.model.Treino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TreinoRepository extends JpaRepository<Treino, Long> {
    List<Treino> findAllByUserId(Long userId);
    List<Treino> findAllByUser_Role(com.spring.gymcontrol.enums.Role role);
    void deleteAllByUserId(Long userId);
}
