package com.interviewprep.springbootdemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the application.
 *
 * ------------------------------------------------------------------------------------
 * SENIOR INTERVIEW QUESTION: "What actually happens when a Spring Boot app starts?"
 * ------------------------------------------------------------------------------------
 *
 * {@code @SpringBootApplication} is itself a meta-annotation that bundles three things:
 *
 *   1. {@code @SpringBootConfiguration} - a specialization of {@code @Configuration},
 *      marking this class as a source of bean definitions (it's just a regular
 *      {@code @Configuration} with a label Spring Boot tooling recognizes).
 *
 *   2. {@code @ComponentScan} - tells Spring to scan this package (and sub-packages)
 *      for classes annotated {@code @Component}, {@code @Service}, {@code @Repository},
 *      {@code @Controller}/{@code @RestController}, etc., and register them as beans
 *      in the {@code ApplicationContext}. This is why every class in this demo lives
 *      under {@code com.interviewprep.springbootdemo} - move a bean class outside this
 *      package tree and it silently stops being picked up, a classic "why isn't my
 *      bean wired in" bug.
 *
 *   3. {@code @EnableAutoConfiguration} - the actual "magic." At startup, Spring Boot
 *      inspects every JAR on the classpath for a file named
 *      {@code META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}
 *      (pre-Boot-2.7 this lived in {@code spring.factories}). Each line names an
 *      {@code @Configuration} class guarded by conditional annotations such as
 *      {@code @ConditionalOnClass} and {@code @ConditionalOnMissingBean}. Because we
 *      have {@code spring-boot-starter-webmvc} on the classpath, Boot finds
 *      {@code DispatcherServletAutoConfiguration} and {@code WebMvcAutoConfiguration}
 *      and wires up an embedded Tomcat + a {@code DispatcherServlet}. Because we have
 *      the H2 driver + {@code spring-boot-starter-data-jpa}, it finds
 *      {@code DataSourceAutoConfiguration} and {@code HibernateJpaAutoConfiguration}
 *      and builds a {@code DataSource}, an {@code EntityManagerFactory}, and a
 *      {@code PlatformTransactionManager} - all without a single line of XML or
 *      manual {@code @Bean} wiring from us. "Auto-configuration" is really just:
 *      conditional, classpath-driven bean registration that backs off the moment you
 *      define your own matching bean (that's what {@code @ConditionalOnMissingBean}
 *      is for - auto-config is always a *sensible default*, never a hard override).
 *
 * At runtime, {@code SpringApplication.run(...)} does, in order: create and configure
 * an {@code ApplicationContext}, run the component scan + auto-configuration above to
 * register bean *definitions*, instantiate singleton beans and resolve their
 * dependencies (this is where our constructor-injected
 * Controller -> Service -> Repository chain actually gets built), start the embedded
 * servlet container, and finally publish an {@code ApplicationReadyEvent}.
 */
@SpringBootApplication
public class SpringBootDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SpringBootDemoApplication.class, args);
	}

}
