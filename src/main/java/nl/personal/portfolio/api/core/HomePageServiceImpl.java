package nl.personal.portfolio.api.core;

import nl.personal.portfolio.api.core.mapper.ToHomePageDetailsMapper;
import nl.personal.portfolio.api.domain.HomePageDetails;
import nl.personal.portfolio.api.domain.config.career.CareerProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HomePageServiceImpl implements HomePageService {

    @Autowired
    private CareerProperties careerProperties;

    @Autowired
    private ToHomePageDetailsMapper toHomePageDetailsMapper;

    @Override
    public HomePageDetails getDetails() {
        return toHomePageDetailsMapper.map(careerProperties);
    }

}
