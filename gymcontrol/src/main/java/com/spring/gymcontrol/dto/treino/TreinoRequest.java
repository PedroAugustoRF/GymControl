package com.spring.gymcontrol.dto.treino;

import com.spring.gymcontrol.dto.itemtreino.ItemTreinoRequest;
import com.spring.gymcontrol.enums.DiasSemana;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TreinoRequest(
        @NotNull DiasSemana diaSemana,
        @NotEmpty @Valid List<ItemTreinoRequest> itens,
        Long alunoId
) {}
