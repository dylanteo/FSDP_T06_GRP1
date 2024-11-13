package com.test.test;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestCaseOutputRepository extends MongoRepository<TestCaseOutput, String> {
    // Additional query methods can be defined here if needed
}