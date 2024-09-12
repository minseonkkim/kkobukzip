package com.turtlecoin.mainservice.domain.user.repository;


import com.turtlecoin.mainservice.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    Boolean existsByname(String name);
    User findByname(String name);
}