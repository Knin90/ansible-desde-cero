import type { StepContent } from '../types';

export const nivel19Mod2StepsA: StepContent[] = [
  {
    title: 'Filter plugin: extender Jinja2 con funciones propias',
    body: `
      <p>Los filter plugins agregan nuevas funciones al motor de templates Jinja2 de Ansible. Se usan con el pipe <code>|</code> en cualquier template o variable. El archivo se coloca en <code>filter_plugins/</code> junto al playbook.</p>
      <div class="analogy-box">
        <div class="analogy-box-header">💡 Analogía</div>
        <p>Un filter plugin es como agregar una función a tu calculadora que no venía de fábrica. Ansible ya trae funciones como <code>upper</code>, <code>default</code>, <code>to_json</code>. Con un filter plugin agregás funciones propias que entendés el dominio de tu empresa: <code>to_nginx_upstream</code>, <code>mask_password</code>, <code>format_as_cron</code>.</p>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">python</span><span class="code-block-filename">filter_plugins/empresa_filters.py</span></div>
        <pre class="language-python"><code class="language-python">#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Filter plugins para la infraestructura de la empresa.
Coloca este archivo en filter_plugins/ junto al playbook.
"""

import re
import hashlib


def to_nginx_upstream(servers, port=80, weight=1):
"""
Convierte una lista de IPs/hostnames a un bloque upstream de nginx.

Uso en template: {{ backend_ips | to_nginx_upstream(8080) }}
"""
lines = []
for server in servers:
    lines.append(f'    server {server}:{port} weight={weight};')
return '\\n'.join(lines)


def mask_secret(value, visible_chars=4):
"""
Enmascara un secreto dejando visibles solo los últimos N caracteres.
Útil para mostrar tokens en logs sin exponerlos completamente.

Uso: {{ api_token | mask_secret(4) }}  →  "****c3d4"
"""
if not value or len(value) <= visible_chars:
    return '****'
return '*' * (len(value) - visible_chars) + value[-visible_chars:]


def connection_string_mask(conn_str):
"""
Enmascara la contraseña de un connection string.

Uso: {{ db_url | connection_string_mask }}
postgresql://user:password@host/db → postgresql://user:****@host/db
"""
return re.sub(r'://([^:]+):([^@]+)@', r'://\\1:****@', conn_str)


def to_systemd_env(env_dict):
"""
Convierte un diccionario de variables de entorno al formato de
un archivo EnvironmentFile de systemd.

Uso en template: {{ app_env | to_systemd_env }}
"""
lines = []
for key, value in sorted(env_dict.items()):
    # Escapar comillas dobles en el valor
    safe_value = str(value).replace('"', '\\\\"')
    lines.append(f'{key}="{safe_value}"')
return '\\n'.join(lines)


def sha256_truncated(value, length=8):
"""
Genera un hash SHA256 truncado del valor. Útil para nombres únicos.

Uso: {{ app_name | sha256_truncated(6) }}
"""
return hashlib.sha256(str(value).encode()).hexdigest()[:length]


# La clase FilterModule es lo que Ansible busca en el archivo
class FilterModule:
"""Filtros Jinja2 personalizados para la empresa."""

def filters(self):
    """Retorna el mapeo nombre_filtro → función Python."""
    return {
        'to_nginx_upstream': to_nginx_upstream,
        'mask_secret': mask_secret,
        'connection_string_mask': connection_string_mask,
        'to_systemd_env': to_systemd_env,
        'sha256_truncated': sha256_truncated,
    }</code></pre>
      </div>
      <div class="code-block-wrapper">
        <div class="code-block-titlebar"><span class="code-block-lang">yaml</span><span class="code-block-filename">usar-filter-plugins.yml</span></div>
        <pre class="language-yaml"><code class="language-yaml">---
- name: Usar filter plugins propios
  hosts: webservers
  vars:
backend_ips:
  - 10.0.1.10
  - 10.0.1.11
  - 10.0.1.12
db_url: "postgresql://appuser:s3cr3t@db.empresa.com/produccion"
app_env:
  DATABASE_URL: "postgresql://appuser:s3cr3t@db.empresa.com/prod"
  SECRET_KEY: "mi-clave-secreta"
  DEBUG: "false"

  tasks:
- name: Generar configuración de nginx con upstream
  ansible.builtin.template:
    src: nginx_upstream.j2
    dest: /etc/nginx/conf.d/upstream.conf
  vars:
    upstream_block: "{{ backend_ips | to_nginx_upstream(8080) }}"

- name: Mostrar DB URL enmascarada en log
  ansible.builtin.debug:
    msg: "Conectando a: {{ db_url | connection_string_mask }}"

- name: Generar EnvironmentFile para systemd
  ansible.builtin.copy:
    content: "{{ app_env | to_systemd_env }}"
    dest: /etc/app/environment
    mode: '0600'

- name: Nombre único basado en hash
  ansible.builtin.debug:
    msg: "Deploy ID: {{ ansible_hostname | sha256_truncated(8) }}"</code></pre>
      </div>
      <div class="tip-box">
        <span class="box-icon">💡</span>
        <div class="box-content"><strong>Testear filtros en Python puro:</strong> Podés ejecutar <code>python -c "from filter_plugins.empresa_filters import to_nginx_upstream; print(to_nginx_upstream(['10.0.1.1', '10.0.1.2'], 8080))"</code> para probar filtros sin correr un playbook completo.</div>
      </div>
    `
  }
];
