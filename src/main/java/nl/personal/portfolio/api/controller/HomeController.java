package nl.personal.portfolio.api.controller;

import nl.personal.portfolio.core.CareerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;
import java.util.Locale;

@Controller
public final class HomeController {

    private final CareerService careerService;

    public HomeController(final CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping({"/", "/nl", "/nl/"})
    public String home(final Model model, final Locale locale) {
        model.addAttribute("details", careerService.getDetails(locale));
        return "home-page";
    }

    @GetMapping(path = {"/", "/nl", "/nl/"}, params = "lang")
    public ResponseEntity<Void> legacyLanguageParameter(@RequestParam final String lang) {
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .location(URI.create("nl".equals(lang) ? "/nl/" : "/"))
                .build();
    }
}
