package com.spring.gymcontrol.service;

import com.spring.gymcontrol.config.JWTUserData;
import com.spring.gymcontrol.dto.itemtreino.ItemTreinoRequest;
import com.spring.gymcontrol.dto.treino.TreinoRequest;
import com.spring.gymcontrol.dto.treino.TreinoResponse;
import com.spring.gymcontrol.enums.Role;
import com.spring.gymcontrol.enums.DiasSemana;
import com.spring.gymcontrol.model.Treino;
import com.spring.gymcontrol.model.User;
import com.spring.gymcontrol.repository.TreinoRepository;
import com.spring.gymcontrol.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class TreinoService {

    private final TreinoRepository treinoRepository;
    private final ItemTreinoService itemTreinoService;
    private final UserRepository userRepository;

    @Transactional
    public TreinoResponse save(TreinoRequest request, JWTUserData principal) {
        User destino = resolveDestino(request.alunoId(), principal);
        Treino treino = Treino.builder().user(destino).diaSemana(request.diaSemana()).build();
        adicionarItens(treino, request.itens());
        return toResponse(treinoRepository.save(treino));
    }

    @Transactional(readOnly = true)
    public List<TreinoResponse> findAll(JWTUserData principal) {
        List<Treino> treinos = new ArrayList<>();
        if (principal.role() == Role.ADM) {
            treinos = treinoRepository.findAll();
        } else if (principal.role() == Role.PROF) {
            treinos.addAll(treinoRepository.findAllByUserId(principal.userId()));
            treinos.addAll(treinoRepository.findAllByUser_Role(Role.USER));
        } else {
            treinos = treinoRepository.findAllByUserId(principal.userId()).stream()
                    .filter(t -> t.getDiaSemana() == today())
                    .toList();
        }
        return treinos.stream().distinct().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<TreinoResponse> findById(Long id, JWTUserData principal) {
        return treinoRepository.findById(id).filter(t -> canRead(t, principal)).map(this::toResponse);
    }

    @Transactional
    public TreinoResponse update(Long id, TreinoRequest request, JWTUserData principal) {
        Treino treino = treinoRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Treino não encontrado"));
        ensureCanManage(treino, principal);
        treino.setUser(resolveDestino(request.alunoId(), principal));
        treino.setDiaSemana(request.diaSemana());
        treino.getItens().clear();
        adicionarItens(treino, request.itens());
        return toResponse(treinoRepository.save(treino));
    }

    @Transactional
    public void deleteById(Long id, JWTUserData principal) {
        Treino treino = treinoRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Treino não encontrado"));
        ensureCanManage(treino, principal);
        treinoRepository.delete(treino);
    }

    private User resolveDestino(Long alunoId, JWTUserData principal) {
        if (alunoId == null || alunoId.equals(principal.userId())) {
            return userRepository.findById(principal.userId()).orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        }
        if (principal.role() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Alunos não podem cadastrar treinos");
        }
        User destino = userRepository.findById(alunoId).orElseThrow(() -> new EntityNotFoundException("Aluno não encontrado"));
        if (principal.role() == Role.PROF && destino.getRole() != Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O professor só pode atribuir treinos a alunos");
        }
        return destino;
    }

    private boolean canRead(Treino treino, JWTUserData principal) {
        if (principal.role() == Role.ADM) return true;
        if (principal.role() == Role.USER) {
            return treino.getUser().getId().equals(principal.userId()) && treino.getDiaSemana() == today();
        }
        if (treino.getUser().getId().equals(principal.userId())) return true;
        return principal.role() == Role.PROF && treino.getUser().getRole() == Role.USER;
    }

    private void ensureCanManage(Treino treino, JWTUserData principal) {
        if (principal.role() == Role.ADM) return;
        if (principal.role() == Role.PROF && (treino.getUser().getId().equals(principal.userId()) || treino.getUser().getRole() == Role.USER)) return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para alterar este treino");
    }

    private DiasSemana today() {
        return switch (LocalDate.now(ZoneId.of("America/Sao_Paulo")).getDayOfWeek()) {
            case MONDAY -> DiasSemana.SEGUNDA;
            case TUESDAY -> DiasSemana.TERCA;
            case WEDNESDAY -> DiasSemana.QUARTA;
            case THURSDAY -> DiasSemana.QUINTA;
            case FRIDAY -> DiasSemana.SEXTA;
            case SATURDAY -> DiasSemana.SABADO;
            case SUNDAY -> DiasSemana.DOMINGO;
        };
    }

    private void adicionarItens(Treino treino, List<ItemTreinoRequest> itens) {
        itens.forEach(item -> treino.getItens().add(itemTreinoService.toEntity(item, treino)));
    }

    private TreinoResponse toResponse(Treino treino) {
        return TreinoResponse.builder()
                .id(treino.getId())
                .diaSemana(treino.getDiaSemana())
                .alunoId(treino.getUser().getId())
                .alunoNome(treino.getUser().getNome())
                .itens(treino.getItens().stream().map(itemTreinoService::toResponse).toList())
                .build();
    }
}
