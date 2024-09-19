// package com.turtlecoin.mainservice.global.config;
//
// import com.netflix.discovery.converters.Auto;
// import com.turtlecoin.mainservice.domain.document.entity.Document;
// import jakarta.persistence.EntityManagerFactory;
// import lombok.RequiredArgsConstructor;
// import org.springframework.batch.core.Job;
// import org.springframework.batch.core.Step;
// import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
// import org.springframework.batch.core.job.builder.JobBuilder;
// import org.springframework.batch.core.repository.JobRepository;
// import org.springframework.batch.core.step.builder.StepBuilder;
// import org.springframework.batch.item.ItemProcessor;
// import org.springframework.batch.item.database.JpaItemWriter;
// import org.springframework.batch.item.database.JpaPagingItemReader;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Qualifier;
// import org.springframework.boot.autoconfigure.batch.BatchProperties;
// import org.springframework.boot.context.properties.EnableConfigurationProperties;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.transaction.PlatformTransactionManager;
//
// @Configuration
// @EnableConfigurationProperties
// public class BatchConfig {
//     @Autowired
//     @Qualifier("mainEntityManagerFactory")
//     private EntityManagerFactory entityManagerFactory;
//
//     private int chunk = 10;
//
//     @Bean
//     public Job DocUpdateJob(@Qualifier("metaJobRepository") JobRepository jobRepository,
//                                Step updateDocumentStep) {
//         return new JobBuilder("DocUpdateJob", jobRepository)
//                 .start(updateDocumentStep)
//                 .build();
//     }
//
//     @Bean
//     public Step updateDocumentStep(@Qualifier("metaJobRepository") JobRepository jobRepository,
//                                    @Qualifier("mainTransactionManager") PlatformTransactionManager mainTransactionManager){
//         return new StepBuilder("updateDocuments", jobRepository)
//                 .<Document, Document>chunk(chunk, mainTransactionManager)
//                 .reader(jpaDocumentReader(entityManagerFactory))
//                 .processor(updateDocumentsProcessor())
//                 .writer(jpaDocumentWriter(entityManagerFactory))
//                 .build();
//     }
//
//     @Bean
//     public JpaPagingItemReader<Document> jpaDocumentReader(EntityManagerFactory entityManagerFactory) {
//         JpaPagingItemReader<Document> reader = new JpaPagingItemReader<>();
//         reader.setEntityManagerFactory(entityManagerFactory);
//         reader.setQueryString("SELECT d FROM Document d where d.documentHash IS NULL");
//         reader.setPageSize(10); // chunk 크기와 일치
//         return reader;
//     }
//
//     @Bean
//     public ItemProcessor<Document, Document> updateDocumentsProcessor() {
//         return document -> {
//
//             System.out.println(document.getDocType());
//             // 여기에 블록체인에서 검색해서 가져오는 로직이 들어간다.
//             document.assignHash("0x1234567890");
//
//             return document;
//         };
//     }
//
//     @Bean
//     public JpaItemWriter<Document> jpaDocumentWriter(EntityManagerFactory entityManagerFactory) {
//         JpaItemWriter<Document> writer = new JpaItemWriter<>();
//         writer.setEntityManagerFactory(entityManagerFactory);
//         return writer;
//     }
//
// }
