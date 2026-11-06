package com.spring.gymcontrol.service;

import com.spring.gymcontrol.dto.itemtreino.ItemTreinoRequest;
import com.spring.gymcontrol.dto.treino.TreinoRequest;
import com.spring.gymcontrol.dto.treino.TreinoResponse;
import com.spring.gymcontrol.model.Treino;
import com.spring.gymcontrol.model.User;
import com.spring.gymcontrol.repository.TreinoRepository;
import com.spring.gymcontrol.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TreinoService {

    private final TreinoRepository treinoRepository;
    private final ItemTreinoService itemTreinoService;
    private final UserRepository userRepository;

    @Transactional
    public TreinoResponse save(TreinoRequest request, User user) {
        Treino treino = Treino.builder()
                .user(user)
                .diaSemana(request.diaSemana())
                .build();

        adicionarItens(treino, request.itens());

        return toResponse(treinoRepository.save(treino));
    }

    @Transactional
    public TreinoResponse save(TreinoRequest request, Long userId) {
        return save(request, userRepository.getReferenceById(userId));
    }

    @Transactional(readOnly = true)
    public List<TreinoResponse> findAll() {
        return treinoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<TreinoResponse> findById(Long id) {
        return treinoRepository.findById(id)
                .map(this::toResponse);
    }

    @Transactional
    public TreinoResponse update(Long id, TreinoRequest request) {
        Treino treino = treinoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Treino não encontrado"));

        treino.setDiaSemana(request.diaSemana());
        treino.getItens().clear();
        adicionarItens(treino, request.itens());

        return toResponse(treinoRepository.save(treino));
    }

    @Transactional
    public void deleteById(Long id) {
        treinoRepository.deleteById(id);
    }

    private void adicionarItens(Treino treino, List<ItemTreinoRequest> itens) {
        itens.forEach(item -> treino.getItens().add(itemTreinoService.toEntity(item, treino)));
    }

    private TreinoResponse toResponse(Treino treino) {
        return TreinoResponse.builder()
                .id(treino.getId())
                .diaSemana(treino.getDiaSemana())
                .itens(treino.getItens().stream()
                        .map(itemTreinoService::toResponse)
                        .toList())
                .build();
    }
}