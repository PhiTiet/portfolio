package nl.personal.portfolio.api.controller;

import lombok.RequiredArgsConstructor;
import nl.personal.portfolio.core.CareerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Controller
@RequiredArgsConstructor
@RequestMapping("/")
public class HomeController {

    private final CareerService careerService;

    @RequestMapping(method = {POST, GET})
    public String home(Model model) {
        model.addAttribute("details", careerService.getDetails());
        return "home-page";
    }
}
