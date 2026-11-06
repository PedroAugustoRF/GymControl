package com.spring.gymcontrol.enums;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

public enum Role implements GrantedAuthority {
    USER,
    ADM;

    @Override
    public @Nullable String getAuthority() {
        return this.name();
    }
}