package nl.personal.portfolio.api.controller;

import lombok.RequiredArgsConstructor;
import nl.personal.portfolio.core.HomePageService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Controller
@RequiredArgsConstructor
@RequestMapping("/")
public class HomeController {

    private final HomePageService homePageService;

    @RequestMapping(method = {POST, GET})
    public String home(Model model) {
        final var details = homePageService.getDetails();
        model.addAttribute("details", details);
        return "home-page";
    }
}
