package net.czedik.hermann.tdt;

import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
public class Controller {

    @GetMapping(path = "/image")
    public void getImage(HttpServletResponse response) throws IOException {
        response.setContentType(MediaType.IMAGE_PNG_VALUE);
        // TODO path
        try (InputStream in = new FileInputStream("/home/hermann/test.png")) {
            StreamUtils.copy(in, response.getOutputStream());
        }
    }

}
