package com.spring.gymcontrol.dto.userrole;

import com.spring.gymcontrol.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UserRoleRequest(
        @NotNull Role role
) {}