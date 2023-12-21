package nl.personal.portfolio.core;

import lombok.RequiredArgsConstructor;
import nl.personal.portfolio.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.domain.HomePageDetails;
import nl.personal.portfolio.domain.config.career.CareerProperties;
import org.springframework.stereotype.Service;

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
