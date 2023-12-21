package nl.personal.portfolio.api.controller;

import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;
import nl.personal.portfolio.api.core.HomePageService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/")
public class HomeController {

    private final HomePageService homePageService;

    @GetMapping()
    public String home(Model model){
        var details = homePageService.getDetails();
        model.addAttribute("details", details);
        return "home-page";
    }
}
