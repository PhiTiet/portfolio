package nl.personal.portfolio.core;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("DiscordWebhookClient")
class DiscordWebhookClientTest {

    @Test
    @DisplayName("should send message to Discord webhook when URL is configured")
    void sendMessage_withConfiguredUrl_sendsToWebhook() {
        var requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class, Answers.RETURNS_SELF);
        var requestBodySpec = mock(RestClient.RequestBodySpec.class, Answers.RETURNS_SELF);
        var responseSpec = mock(RestClient.ResponseSpec.class);
        var restClient = mock(RestClient.class);
        var restClientBuilder = mock(RestClient.Builder.class);

        when(restClientBuilder.build()).thenReturn(restClient);
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toBodilessEntity()).thenReturn(null);

        var client = new DiscordWebhookClient("https://discord.webhook.url", restClientBuilder);

        client.sendMessage("John Doe", "john@example.com", "Test message");

        verify(restClient).post();
        verify(requestBodyUriSpec).uri("https://discord.webhook.url");
        verify(requestBodySpec).contentType(MediaType.APPLICATION_JSON);
        verify(requestBodySpec).retrieve();
        verify(responseSpec).toBodilessEntity();
    }

    @Test
    @DisplayName("should skip sending when webhook URL is not configured")
    void sendMessage_withoutConfiguredUrl_skips() {
        var restClient = mock(RestClient.class);
        var restClientBuilder = mock(RestClient.Builder.class);

        when(restClientBuilder.build()).thenReturn(restClient);

        var client = new DiscordWebhookClient("", restClientBuilder);

        client.sendMessage("John Doe", "john@example.com", "Test message");

        verifyNoInteractions(restClient);
    }

    @Test
    @DisplayName("should handle errors gracefully when webhook fails")
    void sendMessage_whenWebhookFails_logsError() {
        var requestBodyUriSpec = mock(RestClient.RequestBodyUriSpec.class, Answers.RETURNS_SELF);
        var requestBodySpec = mock(RestClient.RequestBodySpec.class, Answers.RETURNS_SELF);
        var responseSpec = mock(RestClient.ResponseSpec.class);
        var restClient = mock(RestClient.class);
        var restClientBuilder = mock(RestClient.Builder.class);

        when(restClientBuilder.build()).thenReturn(restClient);
        when(restClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toBodilessEntity()).thenThrow(new RuntimeException("Webhook error"));

        var client = new DiscordWebhookClient("https://discord.webhook.url", restClientBuilder);

        client.sendMessage("John Doe", "john@example.com", "Test message");

        verify(requestBodySpec).retrieve();
    }
}
