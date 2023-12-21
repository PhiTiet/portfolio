package nl.personal.portfolio.api.core;

import nl.personal.portfolio.api.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.api.domain.HomePageDetails;
import nl.personal.portfolio.api.domain.config.career.CareerProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomePageServiceImpl implements HomePageService {
    private final CareerProperties careerProperties;
    private final ToHomePageDetailsMapper toHomePageDetailsMapper;

    @Override
    public HomePageDetails getDetails() {
        return toHomePageDetailsMapper.map(careerProperties);
    }

}
