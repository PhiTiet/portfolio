package nl.personal.portfolio.api.controller;

import nl.personal.portfolio.core.CareerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public final class HomeController {

    private final CareerService careerService;

    public HomeController(final CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping
    public String home(final Model model) {
        model.addAttribute("details", careerService.getDetails());
        return "home-page";
    }
}
