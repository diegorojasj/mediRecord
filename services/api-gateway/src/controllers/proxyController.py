import httpx
from fastapi import HTTPException, Response

NO_BODY = object()


def _response_body(response: httpx.Response):
    if not response.content:
        return NO_BODY
    if "application/json" in response.headers.get("content-type", ""):
        try:
            return response.json()
        except ValueError:
            pass
    return response.text


def _error_detail(response: httpx.Response, service_name: str):
    body = _response_body(response)
    if body is NO_BODY:
        return f"{service_name} returned HTTP {response.status_code}"
    if isinstance(body, dict) and "detail" in body:
        return body["detail"]
    return body or f"{service_name} returned HTTP {response.status_code}"


async def forward_json(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    *,
    service_name: str,
    json_data=None,
):
    try:
        response = await client.request(method, url, json=json_data)
        response.raise_for_status()
    except httpx.ConnectError as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                f"{service_name} is unavailable. "
                "Check that the service is running and reachable."
            ),
        ) from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=504,
            detail=f"{service_name} did not respond in time.",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=_error_detail(exc.response, service_name),
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"{service_name} request failed: {exc.__class__.__name__}",
        ) from exc

    body = _response_body(response)
    if body is NO_BODY:
        return Response(status_code=response.status_code)
    return body
