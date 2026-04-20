import net.ltgt.gradle.errorprone.errorprone
import net.ltgt.gradle.errorprone.CheckSeverity

plugins {
	java
	id("org.springframework.boot") version "4.0.5"
	id("io.spring.dependency-management") version "1.1.7"
    id("net.ltgt.errorprone") version "5.1.0"
	id("org.sonarqube") version "7.2.3.7755"
}

group = "net.czedik.hermann"
version = "1.0.0-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(25)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	implementation("org.springframework.boot:spring-boot-starter-websocket")
	implementation("org.springframework.boot:spring-boot-starter-validation")

	developmentOnly("org.springframework.boot:spring-boot-devtools")
	
	testImplementation("org.springframework.boot:spring-boot-starter-validation-test")
	testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
	testImplementation("org.springframework.boot:spring-boot-starter-websocket-test")

	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	
	implementation("org.apache.commons:commons-lang3:3.20.0")

	errorprone("com.google.errorprone:error_prone_core:2.49.0")
	errorprone("com.uber.nullaway:nullaway:0.13.3")
}

tasks.withType<Test> {
	useJUnitPlatform()
}

tasks.withType<JavaCompile>().configureEach {
	options.errorprone {
		check("NullAway", CheckSeverity.ERROR)
		option("NullAway:AnnotatedPackages", "net.czedik.hermann")
	}
}

sonar {
	properties {
		property("sonar.projectKey", "Bronkoknorb_type-draw-type-server")
		property("sonar.organization", "bronkoknorb")
	}
}
