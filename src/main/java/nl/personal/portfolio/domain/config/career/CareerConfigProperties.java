package nl.personal.portfolio.domain.config.career;

import nl.personal.portfolio.domain.Certificate;
import nl.personal.portfolio.domain.Hobby;
import nl.personal.portfolio.domain.Skill;
import nl.personal.portfolio.domain.TimelineEvent;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

import static nl.personal.portfolio.domain.DatePatterns.INPUT_FORMAT;

public class CareerConfigProperties implements CareerProperties {

    @DateTimeFormat(pattern = INPUT_FORMAT)
    private LocalDate birthday;

    @DateTimeFormat(pattern = INPUT_FORMAT)
    private LocalDate professionalCareerStartDate;

    @DateTimeFormat(pattern = INPUT_FORMAT)
    private LocalDate programmingStartDate;

    private List<Certificate> certificates;

    private List<Skill> skills;

    private List<TimelineEvent> events;

    private List<Hobby> hobbies;

    @Override
    public LocalDate getBirthday() {
        return birthday;
    }

    public void setBirthday(final LocalDate birthday) {
        this.birthday = birthday;
    }

    @Override
    public LocalDate getProfessionalCareerStartDate() {
        return professionalCareerStartDate;
    }

    public void setProfessionalCareerStartDate(final LocalDate professionalCareerStartDate) {
        this.professionalCareerStartDate = professionalCareerStartDate;
    }

    @Override
    public LocalDate getProgrammingStartDate() {
        return programmingStartDate;
    }

    public void setProgrammingStartDate(final LocalDate programmingStartDate) {
        this.programmingStartDate = programmingStartDate;
    }

    @Override
    public List<Certificate> getCertificates() {
        return certificates;
    }

    public void setCertificates(final List<Certificate> certificates) {
        this.certificates = certificates;
    }

    @Override
    public List<Skill> getSkills() {
        return skills;
    }

    public void setSkills(final List<Skill> skills) {
        this.skills = skills;
    }

    @Override
    public List<TimelineEvent> getEvents() {
        return events;
    }

    public void setEvents(final List<TimelineEvent> events) {
        this.events = events;
    }

    @Override
    public List<Hobby> getHobbies() {
        return hobbies;
    }

    public void setHobbies(final List<Hobby> hobbies) {
        this.hobbies = hobbies;
    }
}
